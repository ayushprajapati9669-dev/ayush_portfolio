import React from 'react';
import { InteractiveSkillsWidget } from '../../components/ui/InteractiveSkillsWidget';

export function SkillsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 pt-8">
      <InteractiveSkillsWidget isStandalonePage={true} />
    </div>
  );
}
