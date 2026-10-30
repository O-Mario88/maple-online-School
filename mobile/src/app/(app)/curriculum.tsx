import { Screen } from '@/components/ui';
import { ProgrammeView } from '@/features/curriculum/ProgrammeView';

/** The Uganda national curriculum every Maple school starts from. */
export default function CurriculumScreen() {
  return (
    <Screen
      width="wide"
      eyebrow="Uganda · NCDC"
      title="Curriculum"
      subtitle="Every level, class and subject a Maple school starts with, and the rules for choosing them.">
      <ProgrammeView country="UG" />
    </Screen>
  );
}
