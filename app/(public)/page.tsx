// SSG: no usa cookies, headers ni datos por usuario, así que Next la genera en el
// build y Vercel la sirve desde CDN (docs/design/web-frontend-architecture.md §3)
export default function LandingPage() {
  return (
    <main className="landing">
      <header>
        <h1>KinesiApp</h1>
        <p className="lead">
          Graba un salto o una sentadilla desde el navegador y recibe una
          estimación del riesgo de lesión de rodilla a partir de los ángulos
          articulares del movimiento.
        </p>
      </header>

      <ul className="features">
        <li>
          <h2>Deportistas</h2>
          <p>Registra tus movimientos y sigue la evolución de tu riesgo.</p>
        </li>
        <li>
          <h2>Entrenadores</h2>
          <p>Gestiona a tu equipo y revisa los análisis de cada deportista.</p>
        </li>
        <li>
          <h2>Desde cualquier dispositivo</h2>
          <p>Funciona en el navegador del celular y del computador.</p>
        </li>
      </ul>

      <footer>
        KinesiApp es una herramienta de apoyo y no reemplaza la valoración de
        un profesional de la salud.
      </footer>
    </main>
  );
}
