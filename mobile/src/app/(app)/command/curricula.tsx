import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { CurriculaDesk, CurriculaPhone } from '@/features/command/views/CurriculaViews';

/** Maple Command › Global Curriculum & Living Past-Paper Master Taxonomies (`/(command)/curricula`). */
export default function CurriculaScreen() {
  return <CommandRoute desk={CurriculaDesk} phone={CurriculaPhone} title="Curricula" subtitle="Shared national curriculum templates schools and teachers clone from" />;
}
