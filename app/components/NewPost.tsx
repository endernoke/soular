import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { UserShort } from '@/types';

export default function NewPost({ onPostCreated }: { onPostCreated?: () => void }) {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      setIsLoading(true);
      const author: UserShort = {
        uid: user.uid,
        displayName: user.displayName,
        photoUrl: user.photoUrl
      };

      await addDoc(collection(db, 'posts'), {
        content: newPost.trim(),
        createdAt: serverTimestamp(),
        author
      });
      setNewPost('');
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.createPost}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={newPost}
        onChangeText={setNewPost}
        multiline
      />
      <TouchableOpacity 
        style={[styles.postButton, (!newPost.trim() || isLoading) && styles.postButtonDisabled]}
        onPress={handleCreatePost}
        disabled={!newPost.trim() || isLoading}
      >
        <Text style={styles.postButtonText}>
          {isLoading ? 'Posting...' : 'Post'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  createPost: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  postButtonDisabled: {
    opacity: 0.7,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});