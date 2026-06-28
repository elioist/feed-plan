import type { ReactNode } from 'react';
import styles from '../../styles.module.scss';

interface SectionTitleProps {
  children: ReactNode;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return <h3 className={styles.sectionTitle}>{children}</h3>;
}
