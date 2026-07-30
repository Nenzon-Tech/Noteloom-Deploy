import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { ChevronDown, Edit, Key, RotateCcw, Trash2, User } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface UserProfileDropdownProps {
  userName?: string;
  userEmail?: string;
  userUid?: string;
  onOptionClick: (optionId: string) => void;
}

export const UserProfileDropdown = ({ userName = 'User', userEmail, userUid, onOptionClick }: UserProfileDropdownProps) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = () => {
    return userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const menuOptions = [
    { id: 'modify', label: 'Modify My Details', icon: Edit },
    { id: 'change-password', label: 'Change Password', icon: Key },
    { id: 'reset-password', label: 'Reset Password', icon: RotateCcw },
    { id: 'delete-account', label: 'Delete Account', icon: Trash2, danger: true },
  ];

  return (
    <View>
      <TouchableOpacity onPress={() => setIsOpen(true)} style={styles.trigger} activeOpacity={0.7}>
        <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', borderColor: '#3b82f6' }]}>
          <Text style={[styles.avatarText, { color: isDarkMode ? 'white' : '#111827' }]}>{getInitials()}</Text>
        </View>
        <ChevronDown size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable style={[styles.dropdown, { backgroundColor: isDarkMode ? 'rgba(31,41,55,0.95)' : 'rgba(255,255,255,0.95)', borderColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(229,231,235,0.5)' }]}>
            <View style={[styles.userInfo, { borderBottomColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(229,231,235,0.5)' }]}>
              <View style={[styles.avatarLarge, { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }]}>
                <User size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              </View>
              <Text style={[styles.userName, { color: isDarkMode ? 'white' : '#111827' }]}>{userName}</Text>
              {userEmail && <Text style={[styles.userEmail, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{userEmail}</Text>}
              {userUid && <Text style={[styles.userUid, { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', color: isDarkMode ? '#93c5fd' : '#2563eb' }]}>ID: {userUid}</Text>}
            </View>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => { setIsOpen(false); onOptionClick(option.id); }}
                style={styles.menuItem}
                activeOpacity={0.7}
              >
                <option.icon size={16} color={option.danger ? '#ef4444' : isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Text style={[styles.menuItemText, { color: option.danger ? '#ef4444' : isDarkMode ? '#d1d5db' : '#4b5563' }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: { fontSize: 14, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-start', paddingTop: 100, paddingHorizontal: 24 },
  dropdown: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', maxWidth: 320, alignSelf: 'flex-end' },
  userInfo: { padding: 20, alignItems: 'center', borderBottomWidth: 1 },
  avatarLarge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 8 },
  userUid: { fontSize: 12, fontFamily: 'monospace', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 20 },
  menuItemText: { fontSize: 15, fontWeight: '500' },
});

export default UserProfileDropdown;
