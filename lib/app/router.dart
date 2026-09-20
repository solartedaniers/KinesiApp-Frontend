import 'package:go_router/go_router.dart';

import '../core/navigation/app_routes.dart';
import '../core/navigation/role_home_resolver.dart';
import '../models/auth/session_status.dart';
import '../services/auth/session_controller.dart';
import '../views/admin/admin_home_view.dart';
import '../views/athlete/athlete_home_view.dart';
import '../views/auth/login_view.dart';
import '../views/auth/otp_verification_view.dart';
import '../views/auth/register_view.dart';
import '../views/auth/splash_view.dart';
import '../views/coach/coach_home_view.dart';

/// Construye el `GoRouter` de la app: la única guarda de acceso es [_redirect],
/// que decide sólo con [SessionController.status] (y el rol), reevaluada
/// automáticamente cada vez que la sesión cambia (`refreshListenable`).
GoRouter buildAppRouter(SessionController session) {
  const authRoutes = {
    AppRoutes.login,
    AppRoutes.register,
    AppRoutes.verifyEmail,
  };

  String? redirect(_, GoRouterState state) {
    final location = state.matchedLocation;
    switch (session.status) {
      case SessionStatus.unknown:
        return location == AppRoutes.splash ? null : AppRoutes.splash;
      case SessionStatus.unauthenticated:
        return authRoutes.contains(location) ? null : AppRoutes.login;
      case SessionStatus.authenticated:
        final home = RoleHomeResolver.resolve(session.currentUser!.role);
        return (authRoutes.contains(location) || location == AppRoutes.splash)
            ? home
            : null;
    }
  }

  return GoRouter(
    initialLocation: AppRoutes.splash,
    refreshListenable: session,
    redirect: redirect,
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashView(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginView(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterView(),
      ),
      GoRoute(
        path: AppRoutes.verifyEmail,
        builder: (context, state) =>
            OtpVerificationView(email: state.extra as String? ?? ''),
      ),
      GoRoute(
        path: AppRoutes.athleteHome,
        builder: (context, state) => const AthleteHomeView(),
      ),
      GoRoute(
        path: AppRoutes.coachHome,
        builder: (context, state) => const CoachHomeView(),
      ),
      GoRoute(
        path: AppRoutes.adminHome,
        builder: (context, state) => const AdminHomeView(),
      ),
    ],
  );
}
