import React, { FunctionComponent, CSSProperties } from 'react';
import { WizardStep } from './Wizard';

interface ComponentProps {
  steps: WizardStep[];
  activeKey: string;
  wizardWidth: number;
}

const getMoveDistance = (
  tabWidth: number,
  activeIndex: number,
  count: number,
  isMobile = false,
): number => {
  if (isMobile) {
    const mobileDistance = ((tabWidth * count) / 2) * activeIndex;
    if (activeIndex % 2 === 0) {
      return mobileDistance - 8;
    } else if (activeIndex % 2 === 1) {
      return mobileDistance + 8;
    }

    return mobileDistance;
  }

  return activeIndex === 0 ? 0 : tabWidth * activeIndex;
};

const getVerticalLevel = (activeIndex: number, isMobile = false): number => {
  if (isMobile) {
    return (activeIndex / 2) * 38;
  }

  return 0;
};

const getWidth = (tabWidth: number, count: number, isMobile = false): number => {
  if (isMobile) {
    return (tabWidth * count) / 2;
  }

  return tabWidth;
};

const WizardMovingTab: FunctionComponent<ComponentProps> = ({ children, steps, ...props }) => {
  const count = steps.length;
  const isMobile = window.document.body.clientWidth < 950 && count > 3;
  const activeIndex = steps.findIndex((step) => step.key.includes(props.activeKey));
  const tabWidth = props.wizardWidth / count;
  const moveDistance = getMoveDistance(tabWidth, activeIndex, count, isMobile);
  const verticalLevel = getVerticalLevel(activeIndex, isMobile);

  const style: CSSProperties = {
    width: getWidth(tabWidth, count, isMobile),
    transform: `translate3d(${moveDistance}px, ${verticalLevel}px, 0)`,
    transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)',
  };

  return (
    <div className="moving-tab" style={style}>
      {children}
    </div>
  );
};

export { WizardMovingTab };
