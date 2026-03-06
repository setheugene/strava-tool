interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  href?: string;
}

export function StatCard({ title, value, subtitle, icon, href }: Props) {
  const inner = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {icon && (
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
          {icon}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-orange-200 hover:shadow-md transition-all"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      {inner}
    </div>
  );
}
