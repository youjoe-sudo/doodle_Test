export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-cream p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="h-12 w-12 bg-terracotta rounded-md flex items-center justify-center mx-auto">
          DR
        </div>
        <h1 className="text-2xl font-bold ink">Doodle Room</h1>
        <p className="text-muted">A cozy little corner for books, gifts & lovely little things</p>
        {children}
      </div>
    </div>
  );
};