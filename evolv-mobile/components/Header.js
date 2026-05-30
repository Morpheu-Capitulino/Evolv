import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Header({ title, subtitle, rightIcon, onRightIconClick }) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {rightIcon && (
        <TouchableOpacity style={styles.rightBtn} onPress={onRightIconClick}>
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // Espaço para a status bar
    paddingBottom: 20,
  },
  subtitle: { color: '#8b92a5', fontSize: 14, fontWeight: '600' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  rightBtn: {
    width: 40, height: 40,
    backgroundColor: 'rgba(58, 181, 74, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});