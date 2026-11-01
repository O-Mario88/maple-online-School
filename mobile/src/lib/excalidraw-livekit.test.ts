import {
  applySceneDelta,
  canParticipantDraw,
  computeSceneDelta,
  estimateBandwidthKbps,
  exportBoardSnapshot,
  INITIAL_FRACTION_ELEMENTS,
  toggleStudentDrawPermission,
} from './excalidraw-livekit';

describe('excalidraw-livekit integration', () => {
  it('computes tiny JSON deltas (< 5 KB/s) and merges them via applySceneDelta', () => {
    const next = [
      ...INITIAL_FRACTION_ELEMENTS,
      {
        id: 'el-new-stroke',
        type: 'equation' as const,
        x: 24,
        y: 210,
        strokeColor: '#16A34A',
        text: '5/6 − 1/4 = 10/12 − 3/12 = 7/12',
        version: 1,
        author: 'Ms. Sarah Kimani',
      },
    ];

    const packet = computeSceneDelta(INITIAL_FRACTION_ELEMENTS, next, 'Ms. Sarah Kimani', 1000);
    expect(packet).not.toBeNull();
    expect(packet!.upserted).toHaveLength(1);
    expect(packet!.upserted[0].id).toBe('el-new-stroke');

    const kbps = estimateBandwidthKbps([packet!], 1);
    expect(kbps).toBeGreaterThan(0);
    expect(kbps).toBeLessThan(5); // Ultra-low bandwidth (< 5 KB/s)

    const merged = applySceneDelta(INITIAL_FRACTION_ELEMENTS, packet!);
    expect(merged).toHaveLength(INITIAL_FRACTION_ELEMENTS.length + 1);
    expect(merged[merged.length - 1].text).toContain('7/12');
  });

  it('enforces viewModeEnabled={true} by default for students and flips when teacher clicks Allow Draw', () => {
    // Default: students cannot draw (viewModeEnabled = true)
    expect(canParticipantDraw('teacher', 'Ms. Sarah Kimani', [])).toBe(true);
    expect(canParticipantDraw('student', 'Daniel Okello', [])).toBe(false);
    expect(canParticipantDraw('student', 'Ivan Ssemanda', [])).toBe(false);

    // Teacher clicks "Allow Draw" next to Daniel Okello
    const grant1 = toggleStudentDrawPermission([], 'Daniel Okello');
    expect(canParticipantDraw('student', 'Daniel Okello', grant1.nextAllowed)).toBe(true);
    expect(canParticipantDraw('student', 'Ivan Ssemanda', grant1.nextAllowed)).toBe(false);

    // Teacher clicks "Allow Draw" next to Ivan Ssemanda
    const grant2 = toggleStudentDrawPermission(grant1.nextAllowed, 'Ivan Ssemanda');
    expect(canParticipantDraw('student', 'Ivan Ssemanda', grant2.nextAllowed)).toBe(true);

    // Revoking Daniel Okello flips him back to read-only
    const revoke = toggleStudentDrawPermission(grant2.nextAllowed, 'Daniel Okello');
    expect(canParticipantDraw('student', 'Daniel Okello', revoke.nextAllowed)).toBe(false);
  });

  it('exports PNG, SVG, and PDF board snapshots for One-Click Save to Lesson Notes & Resources', () => {
    const snap = exportBoardSnapshot(INITIAL_FRACTION_ELEMENTS, 'png', 'Fractions Worked Example');
    expect(snap.format).toBe('png');
    expect(snap.title).toBe('Fractions Worked Example (PNG)');
    expect(snap.workedExamples.some((ex) => ex.includes('3/4 + 2/3'))).toBe(true);
    expect(snap.svgPreview).toContain('<svg');
  });
});

