export function StatusBadge({ value }: { value: string }) {
  const cls =
    value === 'Available' || value === 'Confirm Booking' || value === 'Active'
      ? 'badge badge-success'
      : value === 'Pending' || value === 'Not-Available'
      ? 'badge badge-warning'
      : value === 'Cancelled'
      ? 'badge badge-error'
      : 'badge badge-neutral';

  return <span className={cls}>{value}</span>;
}

export function RoleChip({ role }: { role: string }) {
  const cls =
    role === 'superadmin'
      ? 'role-chip role-superadmin'
      : role === 'admin'
      ? 'role-chip role-admin'
      : 'role-chip role-user';

  return <span className={cls}>{role}</span>;
}
