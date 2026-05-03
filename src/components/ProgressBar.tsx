export default function ProgressBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none">
      <div className="progress-bar h-full gradient-fire-strong origin-left scale-x-0" />
    </div>
  );
}
