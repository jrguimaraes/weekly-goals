import React from 'react';
import { Badge } from '../ui/Badge';
import type { GoalType } from '../../types/goal';

interface GoalTypeBadgeProps {
  type: GoalType;
  size?: 'sm' | 'md';
}

export function GoalTypeBadge({ type, size = 'md' }: GoalTypeBadgeProps) {
  switch (type) {
    case 'BINARY':
      return (
        <Badge variant="info" size={size}>
          Binária
        </Badge>
      );
    case 'QUANTITY':
      return (
        <Badge variant="neutral" size={size}>
          Quantitativa
        </Badge>
      );
    default:
      return <Badge size={size}>{type}</Badge>;
  }
}
