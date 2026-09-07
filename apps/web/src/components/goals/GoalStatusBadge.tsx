import React from 'react';
import { Badge } from '../ui/Badge';
import type { GoalStatus } from '../../types/goal';

interface GoalStatusBadgeProps {
  status: GoalStatus;
  size?: 'sm' | 'md';
}

export function GoalStatusBadge({ status, size = 'md' }: GoalStatusBadgeProps) {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="neutral" size={size}>
          Pendente
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="info" size={size}>
          Em Progresso
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="success" size={size}>
          Concluída
        </Badge>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
}
