import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';

import '../core/navigation/analysis_flow.dart';
import '../core/navigation/app_routes.dart';
import '../core/navigation/role_home_resolver.dart';
import '../core/navigation/route_access_policy.dart';
import '../models/athlete/athlete_profile.dart';
import '../models/auth/session_status.dart';
import '../models/user_role.dart';
import '../services/auth/session_controller.dart';
import '../views/admin/admin_coach_assignment_tab.dart';
import '../views/admin/admin_home_view.dart';
import '../views/admin/admin_shell.dart';
import '../views/admin/admin_users_tab.dart';
import '../views/analysis/analysis_chat_view.dart';
import '../views/analysis/analysis_detail_view.dart';
import '../views/analysis/analysis_status_view.dart';
import '../views/analysis/video_capture_view.dart';
import '../views/analysis/video_consent_view.dart';
import '../views/analysis/video_upload_view.dart';
import '../views/athlete/athlete_analyses_view.dart';
import '../views/athlete/athlete_dashboard_view.dart';
import '../views/athlete/athlete_physical_profile_view.dart';
import '../views/athlete/athlete_shell.dart';
import '../views/athlete/athlete_stats_view.dart';
import '../views/auth/login_view.dart';
import '../views/auth/otp_verification_view.dart';
import '../views/auth/password_recovery_code_view.dart';
import '../views/auth/password_recovery_new_password_view.dart';
import '../views/auth/password_recovery_view.dart';
import '../views/auth/register_view.dart';
import '../views/auth/splash_view.dart';
import '../views/coach/coach_athlete_detail_view.dart';
import '../views/coach/coach_home_view.dart';
import '../views/coach/coach_shell.dart';
import '../views/coach/coach_stats_view.dart';
import '../views/coach/coach_team_analyses_view.dart';
import '../views/profile/account_settings_view.dart';
import '../views/profile/change_password_view.dart';

/// Construye el `GoRouter` de la app: la única guarda de acceso es [_redirect],
/// que decide sólo con [SessionController.status] (y el rol), reevaluada
/// automáticamente cada vez que la sesión cambia (`refreshListenable`).
/// Cada rol tiene un `StatefulShellRoute` cuyas ramas son las pestañas de su
/// barra inferior; conservan su estado y scroll al cambiar de pestaña.
GoRouter buildAppRouter(SessionController session) {
  const authRoutes = {
    AppRoutes.login,
    AppRoutes.register,
    AppRoutes.verifyEmail,
    AppRoutes.passwordRecovery,
    AppRoutes.passwordRecoveryCode,
    AppRoutes.passwordRecoveryNewPassword,
  };

  String? redirect(_, GoRouterState state) {
    final location = state.matchedLocation;
    switch (session.status) {
      case SessionStatus.unknown:
        return location == AppRoutes.splash ? null : AppRoutes.splash;
      case SessionStatus.unauthenticated:
        return authRoutes.contains(location) ? null : AppRoutes.login;
      case SessionStatus.authenticated:
        final role = session.currentUser!.role;
        return RouteAccessPolicy.canAccess(role, location)
            ? null
            : RoleHomeResolver.resolve(role);
    }
  }

  // Pantallas que dependen del `extra` de la anterior (paso de recuperación,
  // deportista, análisis): abiertas sin él (p. ej. recarga en web) vuelven a
  // su pantalla de origen en vez de romperse con un cast nulo.
  GoRouterRedirect requireExtra(String Function() fallback) =>
      (_, state) => state.extra == null ? fallback() : null;
  final toRecoveryStart = requireExtra(() => AppRoutes.passwordRecovery);
  final toRoleHome = requireExtra(
    () => RoleHomeResolver.resolve(session.currentUser!.role),
  );

  StatefulShellBranch tab(String path, GoRouterWidgetBuilder builder) =>
      StatefulShellBranch(
        routes: [GoRoute(path: path, builder: builder)],
      );

  // Refrescar el router re-parsea la ruta y go_router descarta los `extra` que
  // no son JSON (ticket de recuperación, AnalysisFlow...), rompiendo los
  // builders con "Unexpected null value". Por eso sólo se refresca cuando
  // cambia algo que la guarda usa (estado o rol), no con cada notify de la
  // sesión (carga, avatar, nombre...). Un record compara por valor.
  final accessState = ValueNotifier<(SessionStatus, UserRole?)>((
    session.status,
    session.currentUser?.role,
  ));
  session.addListener(
    () => accessState.value = (session.status, session.currentUser?.role),
  );

  return GoRouter(
    initialLocation: AppRoutes.splash,
    refreshListenable: accessState,
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
        path: AppRoutes.passwordRecovery,
        builder: (context, state) =>
            PasswordRecoveryView(initialEmail: state.extra as String? ?? ''),
      ),
      GoRoute(
        path: AppRoutes.passwordRecoveryCode,
        redirect: toRecoveryStart,
        builder: (context, state) =>
            PasswordRecoveryCodeView(email: state.extra! as String),
      ),
      GoRoute(
        path: AppRoutes.passwordRecoveryNewPassword,
        redirect: toRecoveryStart,
        builder: (context, state) => PasswordRecoveryNewPasswordView(
          ticket: state.extra! as PasswordResetTicket,
        ),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) =>
            AthleteShell(navigationShell: shell),
        branches: [
          tab(AppRoutes.athleteHome, (_, _) => const AthleteDashboardView()),
          tab(
            AppRoutes.athletePhysicalProfile,
            (_, _) => const AthletePhysicalProfileView(),
          ),
          tab(AppRoutes.athleteAnalyses, (_, _) => const AthleteAnalysesView()),
          tab(AppRoutes.athleteStats, (_, _) => const AthleteStatsView()),
        ],
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => CoachShell(navigationShell: shell),
        branches: [
          tab(AppRoutes.coachHome, (_, _) => const CoachHomeView()),
          tab(
            AppRoutes.coachTeamAnalyses,
            (_, _) => const CoachTeamAnalysesView(),
          ),
          tab(AppRoutes.coachStats, (_, _) => const CoachStatsView()),
          tab(AppRoutes.coachProfile, (_, _) => const AccountSettingsView()),
        ],
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => AdminShell(navigationShell: shell),
        branches: [
          tab(AppRoutes.adminHome, (_, _) => const AdminHomeView()),
          tab(AppRoutes.adminUsers, (_, _) => const AdminUsersTab()),
          tab(
            AppRoutes.adminAssignments,
            (_, _) => const AdminCoachAssignmentTab(),
          ),
          tab(AppRoutes.adminProfile, (_, _) => const AccountSettingsView()),
        ],
      ),
      GoRoute(
        path: AppRoutes.coachAthleteDetail,
        redirect: toRoleHome,
        builder: (context, state) =>
            CoachAthleteDetailView(athlete: state.extra! as AthleteProfile),
      ),
      GoRoute(
        path: AppRoutes.changePassword,
        builder: (context, state) => const ChangePasswordView(),
      ),
      GoRoute(
        path: AppRoutes.videoConsent,
        redirect: toRoleHome,
        builder: (context, state) =>
            VideoConsentView(athleteId: state.extra! as int),
      ),
      GoRoute(
        path: AppRoutes.videoCapture,
        redirect: toRoleHome,
        builder: (context, state) =>
            VideoCaptureView(athleteId: state.extra! as int),
      ),
      GoRoute(
        path: AppRoutes.videoUpload,
        redirect: toRoleHome,
        builder: (context, state) =>
            VideoUploadView(flow: state.extra! as AnalysisFlow),
      ),
      GoRoute(
        path: AppRoutes.analysisStatus,
        redirect: toRoleHome,
        builder: (context, state) =>
            AnalysisStatusView(flow: state.extra! as AnalysisFlow),
      ),
      GoRoute(
        path: AppRoutes.analysisDetail,
        redirect: (_, state) => _analysisIdOf(state) == null
            ? RoleHomeResolver.resolve(session.currentUser!.role)
            : null,
        builder: (context, state) =>
            AnalysisDetailView(analysisId: _analysisIdOf(state)!),
      ),
      GoRoute(
        path: AppRoutes.analysisChat,
        redirect: toRoleHome,
        builder: (context, state) =>
            AnalysisChatView(analysisId: state.extra! as int),
      ),
    ],
  );
}

int? _analysisIdOf(GoRouterState state) =>
    int.tryParse(state.uri.queryParameters[AppRoutes.analysisIdParam] ?? '');
