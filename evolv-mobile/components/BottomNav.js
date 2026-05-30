import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Home, Dumbbell, TrendingUp, Users, User } from 'lucide-react-native';

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (path) => route.name === path;

  const navItems = [
    { name: 'Home', icon: Home, label: 'Home' },
    { name: 'Treino', icon: Dumbbell, label: 'Treino' },
    { name: 'Progresso', icon: TrendingUp, label: 'Progresso' },
    { name: 'Amigos', icon: Users, label: 'Amigos' },
    { name: 'Perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.name);
        return (
          <TouchableOpacity 
            key={item.name} 
            style={styles.navItem} 
            onPress={() => navigation.navigate(item.name)}
            activeOpacity={0.7}
          >
            <Icon size={24} color={active ? '#3ab54a' : '#8b92a5'} />
            <Text style={[styles.navText, active && styles.activeText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(9, 11, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 10, color: '#8b92a5', marginTop: 4, fontWeight: '600' },
  activeText: { color: '#3ab54a' },
});