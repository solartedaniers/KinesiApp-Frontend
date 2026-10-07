import { AvatarEditor } from "@/components/AvatarEditor";
import { removeMyAvatar, uploadMyAvatar } from "@/lib/actions/profile";
import { getT } from "@/lib/i18n/server";
import type { User } from "@/lib/types";

import { pageStyles as styles } from "@/components/app/page-classes";
import { ProfileNameForm } from "./ProfileNameForm";

/** Foto y nombre de la cuenta propia: igual para deportista, entrenador y administrador. */
export async function ProfileSection({ user }: { user: User }) {
  const t = await getT();
  return (
    <section className={`${styles.card} ${styles.narrow}`} aria-labelledby="profile-section">
      <h2 id="profile-section" className={styles.sectionTitle}>
        {t.profile.title}
      </h2>
      <AvatarEditor name={user.full_name} imageUrl={user.avatar_url} upload={uploadMyAvatar} remove={removeMyAvatar} />
      <ProfileNameForm fullName={user.full_name} />
    </section>
  );
}
