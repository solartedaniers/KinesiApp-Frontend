import 'package:flutter/foundation.dart';

import '../models/athlete/athlete_profile.dart';
import '../models/auth/current_user.dart';
import '../models/jump_analysis/jump_analysis_summary.dart';

/// Estado de carga de un dato remoto que comparten varias pestañas de un rol:
/// se pide una vez en el shell y cada pestaña lo lee vía `ControllerScope`.
/// Quién sabe pedirlo (qué API) lo decide el [fetch] que recibe.
class LoadableController<T> extends ChangeNotifier {
  LoadableController(this._fetch);

  final Future<T> Function() _fetch;

  T? _data;
  bool _hasData = false;
  bool _isLoading = false;
  bool _hasError = false;
  bool _isDisposed = false;

  /// Solo válido con [hasData]; `T` puede ser nullable (p. ej. perfil ausente).
  T get data => _data as T;
  bool get hasData => _hasData;
  bool get isLoading => _isLoading;
  bool get hasError => _hasError;

  Future<void> load() async {
    _isLoading = true;
    _hasError = false;
    notifyListeners();
    try {
      _data = await _fetch();
      _hasData = true;
    } catch (_) {
      _hasError = true;
    } finally {
      _isLoading = false;
      if (!_isDisposed) notifyListeners();
    }
  }

  /// Aplica un dato ya devuelto por la API (p. ej. tras guardar) sin recargar.
  void replace(T data) {
    _data = data;
    _hasData = true;
    notifyListeners();
  }

  @override
  void dispose() {
    _isDisposed = true;
    super.dispose();
  }
}

/// `null` = el deportista todavía no creó su ficha (404 de `/athletes/me`).
typedef AthleteProfileController = LoadableController<AthleteProfile?>;
typedef JumpAnalysesController = LoadableController<List<JumpAnalysisSummary>>;
typedef CoachAthletesController = LoadableController<List<AthleteProfile>>;
typedef AdminData = ({List<CurrentUser> users, List<AthleteProfile> athletes});
typedef AdminDataController = LoadableController<AdminData>;
