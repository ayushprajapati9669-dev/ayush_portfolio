import React from 'react';
import { InteractiveSkillsWidget } from '../../components/ui/InteractiveSkillsWidget';

export function SkillsPage() {
  return (
    <div className="w-full">
      <InteractiveSkillsWidget isStandalonePage={true} />
    </div>
  );
}
