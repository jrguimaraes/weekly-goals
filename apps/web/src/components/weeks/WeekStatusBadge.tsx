import React from 'react';
import { Badge } from '../ui/Badge';
import type { WeekStatus } from '../../types/week';

interface WeekStatusBadgeProps {
  status: WeekStatus;
  size?: 'sm' | 'md';
}

export function WeekStatusBadge({ status, size = 'md' }: WeekStatusBadgeProps) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="success" size={size}>
          Ativa
        </Badge>
      );
    case 'DRAFT':
      return (
        <Badge variant="warning" size={size}>
          Em Planejamento
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge variant="neutral" size={size}>
          Fechada
        </Badge>
      );
    default:
      return <Badge size={size}>{status}</Badge>;
  }
}
