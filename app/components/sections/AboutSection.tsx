type AboutSectionProps = {
  title?: string;
  description?: string;
};

export function AboutSection({ description }: AboutSectionProps) {
  if (!description) return null;

  return (
    <section
      id="about-bio"
      style={{
        paddingBottom: '64px',
        maxWidth: '640px',
      }}
    >
      <div
        style={{
          fontSize: '15px',
          lineHeight: 1.75,
          color: 'var(--text-secondary)',
        }}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </section>
  );
}
