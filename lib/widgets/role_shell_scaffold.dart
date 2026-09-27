import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/localization/app_localizations.dart';
import 'role_home_scaffold.dart';

/// Pestaña de la barra inferior; el índice coincide con la rama del
/// `StatefulShellRoute` del rol.
class ShellDestination {
  const ShellDestination({
    required this.labelKey,
    required this.icon,
    required this.selectedIcon,
  });

  final String labelKey;
  final IconData icon;
  final IconData selectedIcon;
}

/// Acción destacada en el centro de la barra (el "+" del coach).
class ShellCenterAction {
  const ShellCenterAction({
    required this.tooltipKey,
    required this.icon,
    required this.onPressed,
  });

  final String tooltipKey;
  final IconData icon;
  final VoidCallback onPressed;
}

/// Estructura móvil común de los tres roles: [RoleHomeScaffold] con el
/// contenido de la pestaña activa y la barra de navegación inferior fija.
/// Con [centerAction] la barra deja una muesca para el FAB central.
class RoleShellScaffold extends StatelessWidget {
  const RoleShellScaffold({
    super.key,
    required this.navigationShell,
    required this.destinations,
    this.centerAction,
  });

  final StatefulNavigationShell navigationShell;
  final List<ShellDestination> destinations;
  final ShellCenterAction? centerAction;

  void _select(int index) => navigationShell.goBranch(
    index,
    // Tocar la pestaña activa vuelve a su pantalla inicial
    initialLocation: index == navigationShell.currentIndex,
  );

  @override
  Widget build(BuildContext context) {
    final current = destinations[navigationShell.currentIndex];
    final action = centerAction;
    return RoleHomeScaffold(
      titleKey: current.labelKey,
      body: navigationShell,
      floatingActionButton: action == null
          ? null
          : FloatingActionButton(
              onPressed: action.onPressed,
              tooltip: context.tr(action.tooltipKey),
              child: Icon(action.icon),
            ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: action == null
          ? NavigationBar(
              selectedIndex: navigationShell.currentIndex,
              onDestinationSelected: _select,
              destinations: [
                for (final destination in destinations)
                  NavigationDestination(
                    icon: Icon(destination.icon),
                    selectedIcon: Icon(destination.selectedIcon),
                    label: context.tr(destination.labelKey),
                  ),
              ],
            )
          : _NotchedNavigationBar(
              destinations: destinations,
              currentIndex: navigationShell.currentIndex,
              onSelected: _select,
            ),
    );
  }
}

/// Barra con muesca central: la mitad de las pestañas a cada lado del FAB.
class _NotchedNavigationBar extends StatelessWidget {
  const _NotchedNavigationBar({
    required this.destinations,
    required this.currentIndex,
    required this.onSelected,
  });

  final List<ShellDestination> destinations;
  final int currentIndex;
  final ValueChanged<int> onSelected;

  Widget _item(BuildContext context, int index) {
    final destination = destinations[index];
    final selected = index == currentIndex;
    final color = selected
        ? Theme.of(context).colorScheme.primary
        : Theme.of(context).colorScheme.onSurfaceVariant;
    return Expanded(
      child: InkResponse(
        onTap: () => onSelected(index),
        child: Semantics(
          selected: selected,
          button: true,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                selected ? destination.selectedIcon : destination.icon,
                color: color,
              ),
              const SizedBox(height: 2),
              Text(
                context.tr(destination.labelKey),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: color,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final half = destinations.length ~/ 2;
    return BottomAppBar(
      shape: const CircularNotchedRectangle(),
      notchMargin: 8,
      padding: EdgeInsets.zero,
      child: Row(
        children: [
          for (var i = 0; i < half; i++) _item(context, i),
          // Hueco para el FAB central
          const SizedBox(width: 72),
          for (var i = half; i < destinations.length; i++) _item(context, i),
        ],
      ),
    );
  }
}
