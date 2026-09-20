/// Estado tipado de la sesión. `unknown` cubre tanto "todavía no se
/// determinó" como "falló por red, hay que reintentar" (ver
/// `SessionController.hasRestoreError`), así la UI nunca combina booleanos sueltos.
enum SessionStatus { unknown, authenticated, unauthenticated }
