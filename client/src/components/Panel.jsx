export default function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`glass rounded-lg p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold tracking-wide text-white">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
