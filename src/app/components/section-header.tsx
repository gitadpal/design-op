export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.22em] text-[#177e73]">{eyebrow}</p>
      <h1 className="text-3xl tracking-[-0.04em] text-foreground">{title}</h1>
      <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
