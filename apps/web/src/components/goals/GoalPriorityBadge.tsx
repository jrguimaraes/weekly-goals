import React from 'react';
import { Badge } from '../ui/Badge';
import type { GoalPriority } from '../../types/goal';

interface GoalPriorityBadgeProps {
  priority: GoalPriority;
  size?: 'sm' | 'md';
}

export function GoalPriorityBadge({ priority, size = 'md' }: GoalPriorityBadgeProps) {
  switch (priority) {
    case 'LOW':
      return (
        <Badge variant="neutral" size={size}>
          Baixa
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="warning" size={size}>
          Média
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge variant="error" size={size}>
          Alta
        </Badge>
      );
    default:
      return <Badge size={size}>{priority}</Badge>;
  }
}
