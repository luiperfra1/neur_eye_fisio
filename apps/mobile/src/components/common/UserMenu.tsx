import { useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useAuth } from '@/store/auth-context';

type Rect = { x: number; y: number; width: number; height: number };

type UserMenuProps = {
  compact?: boolean;
};

export function UserMenu({ compact = false }: UserMenuProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<Rect | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const triggerRef = useRef<View>(null);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerRect({ x, y, width, height });
      setOpen(true);
    });
  };

  const closeMenu = () => setOpen(false);

  const performLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    closeMenu();

    if (Platform.OS === 'web') {
      const confirmed = typeof window === 'undefined' ? true : window.confirm('Seguro que quieres salir?');
      if (!confirmed) return;
      void performLogout();
      return;
    }

    Alert.alert('Cerrar sesion', 'Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => void performLogout() },
    ]);
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'U';
  const menuTop = triggerRect ? triggerRect.y + triggerRect.height + 6 : 0;

  return (
    <>
      <View ref={triggerRef}>
        <Pressable
          style={({ pressed }) => [
            s.trigger,
            compact && s.triggerCompact,
            pressed && s.triggerPressed,
            open && s.triggerActive,
          ]}
          onPress={openMenu}
          hitSlop={8}
          accessibilityLabel="Menu de usuario"
          accessibilityRole="button"
        >
          <Text style={s.triggerText}>{initials}</Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={s.backdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  s.menu,
                  {
                    top: menuTop,
                    right: triggerRect ? 8 : 8,
                  },
                ]}
              >
                <View style={s.arrow} />

                <View style={s.menuHeader}>
                  <View style={s.menuAvatar}>
                    <Text style={s.menuAvatarText}>{initials}</Text>
                  </View>
                  <View style={s.menuUserInfo}>
                    <Text style={s.menuUsername} numberOfLines={1}>
                      {user?.username ?? 'usuario'}
                    </Text>
                    <Text style={s.menuRole}>Fisioterapeuta</Text>
                  </View>
                </View>

                <View style={s.menuDivider} />

                <Pressable
                  style={({ pressed }) => [s.menuItem, pressed && s.menuItemPressed]}
                  onPress={handleLogout}
                  disabled={loggingOut}
                >
                  <View style={s.menuItemIcon}>
                    <Text style={s.menuItemIconText}>X</Text>
                  </View>
                  <Text style={s.menuItemTextDanger}>
                    {loggingOut ? 'Cerrando...' : 'Cerrar sesion'}
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const MENU_WIDTH = 200;

const s = StyleSheet.create({
  trigger: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  triggerCompact: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  triggerPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  triggerActive: {
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderColor: 'rgba(255,255,255,0.55)',
  },
  triggerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: 12,
    width: MENU_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#D0D7DC',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1A2328',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
      web: {
        shadowColor: '#1A2328',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
      },
    }),
  },
  arrow: {
    position: 'absolute',
    top: -6,
    right: 13,
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: '#D0D7DC',
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  menuAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF6F6',
    borderWidth: 1,
    borderColor: '#B0DCDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E6E7E',
    letterSpacing: 0.3,
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUsername: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A2328',
  },
  menuRole: {
    fontSize: 11,
    color: '#5C6B73',
    marginTop: 1,
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: '#E2E6EA',
    marginHorizontal: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemPressed: {
    backgroundColor: '#FDF2F2',
  },
  menuItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FAE8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemIconText: {
    fontSize: 14,
    color: '#A03030',
  },
  menuItemTextDanger: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A03030',
  },
});
