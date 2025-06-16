import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../app/providers/theme-provider';
import DefaultAvatar from '../DefaultAvatar';

interface AddConnectionModalProps {
  visible: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  user_name: string;
  avatar_url: string | null;
  native_language: string;
  target_languages: string[];
  is_following: boolean;
}

export default function AddConnectionModal({ visible, onClose }: AddConnectionModalProps) {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  async function fetchUsers() {
    setLoading(true);

    // fetch all users except current user
    const { data: userData } = await supabase
      .from('profiles')
      .select('id, name, user_name, avatar_url, native_language')
      .neq('id', profile?.id);

    // fetch all master languages
    const { data: masterLangs } = await supabase
      .from('master_languages')
      .select('id, name');

    // fetch all target languages for all users
    const { data: allLanguages } = await supabase
      .from('languages')
      .select('user_id, name');

    // fetch following list
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', profile?.id);
    const followingIds = (followingData || []).map((f: any) => f.following_id);
    const usersList: User[] = (userData || []).map((u: any) => {
      const nativeLangName = masterLangs?.find((ml: any) => ml.id === u.native_language)?.name || 'Unknown';
      const targetLangs = (allLanguages || [])
        .filter((l: any) => l.user_id === u.id)
        .map((l: any) => l.name);
      return {
        id: u.id,
        name: u.name,
        user_name: u.user_name,
        avatar_url: u.avatar_url,
        native_language: nativeLangName,
        target_languages: targetLangs,
        is_following: followingIds.includes(u.id),
      };
    });
    setUsers(usersList);
    setLoading(false);
  }

  function filteredUsers() {
    if (!search.trim()) return users;
    const lower = search.toLowerCase();
    return users.filter((u) =>
      u.name.toLowerCase().includes(lower) ||
      u.user_name.toLowerCase().includes(lower) ||
      u.native_language.toLowerCase().includes(lower) ||
      u.target_languages.some((lang) => lang.toLowerCase().includes(lower))
    );
  }

  async function toggleFollow(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (user.is_following) {

      // unfollow
      await supabase.from('follows').delete().match({ follower_id: profile?.id, following_id: userId });
    } else {

      // follow
      await supabase.from('follows').insert({ follower_id: profile?.id, following_id: userId });
    }

    // update local state
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_following: !u.is_following } : u
      )
    );
  }

  function goToUserProfile(userId: string) {
    onClose();
    router.push(`/(stack)/profile/${userId}`);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Connection</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={28} color={Colors.light.textPrimary} />
            </Pressable>
          </View>
          {/* Search bar */}
          <View style={styles.searchBarContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.light.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search by name, username, or language..."
              placeholderTextColor={Colors.light.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          {/* User list */}
          <FlatList
            data={filteredUsers().sort((a, b) => a.name.localeCompare(b.name))}
            keyExtractor={(item) => item.id}
            style={styles.userList}
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshing={loading}
            onRefresh={fetchUsers}
            renderItem={({ item }) => (
              <View style={styles.userRow}>
                <TouchableOpacity style={styles.userInfo} onPress={() => goToUserProfile(item.id)}>
                  {item.avatar_url ? (
                    <DefaultAvatar size={48} letter={item.name[0]} />
                  ) : (
                    <DefaultAvatar size={48} letter={item.name[0]} />
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userUsername}>@{item.user_name}</Text>
                    <Text style={styles.userNative}>Native: {item.native_language}</Text>
                    <View style={styles.languageChipsRow}>
                      {item.target_languages.slice(0, 4).map((lang, idx) => (
                        <View key={lang + idx} style={styles.languageChip}>
                          <Text style={styles.languageChipText}>{lang}</Text>
                        </View>
                      ))}
                      {item.target_languages.length > 4 && (
                        <View style={styles.languageChip}>
                          <Text style={styles.languageChipText}>+{item.target_languages.length - 4}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <Pressable
                  style={[styles.followButton, item.is_following ? styles.following : undefined]}
                  onPress={() => toggleFollow(item.id)}
                >
                  <Text style={[styles.followButtonText, item.is_following ? styles.followingText : undefined]}>
                    {item.is_following ? 'Following' : 'Follow'}
                  </Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '80%',
    maxHeight: '95%',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.generalBG,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.generalBG,
    borderRadius: 16,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchBar: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.textPrimary,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  userList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.generalBG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  userUsername: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  userNative: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  languageChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  languageChip: {
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
  },
  languageChipText: {
    color: Colors.light.background,
    fontSize: 12,
    fontWeight: '500',
  },
  followButton: {
    backgroundColor: Colors.light.buttonPrimary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
  },
  followButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  following: {
    backgroundColor: Colors.light.generalBG,
    borderWidth: 1,
    borderColor: Colors.light.buttonPrimary,
  },
  followingText: {
    color: Colors.light.buttonPrimary,
  },
}); 