type WatchedMovieModalProps = {
  isOpen: boolean;
  setShowWatchedModal: (value: boolean) => void;
  watchedTicketCodeInput: string;
  setWatchedTicketCodeInput: (value: string) => void;
  handleRegisterWatchedMovie: () => void;
};

export function WatchedMovieModal({
  isOpen,
  setShowWatchedModal,
  watchedTicketCodeInput,
  setWatchedTicketCodeInput,
  handleRegisterWatchedMovie,
}: WatchedMovieModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-6 font-sans backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-sm border border-black/5 bg-white p-12 shadow-2xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-px w-10 bg-[#B91C1C]"></div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-[#B91C1C]">Viewing Record</p>
        </div>

        <h3 className="mb-4 font-display text-4xl uppercase tracking-tighter text-[#1A1A1A]">Watched Movie Register</h3>
        <p className="mb-10 font-sans text-[11px] font-bold uppercase tracking-widest leading-relaxed text-black/40">
          Enter your ticket number or reservation number to add this screening to your movie story.
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="watched-movie-code" className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/20">
              Ticket Or Reservation Number
            </label>
            <input
              id="watched-movie-code"
              title="Watched Movie Code Input"
              value={watchedTicketCodeInput}
              onChange={(e) => setWatchedTicketCodeInput(e.target.value.replace(/\D/g, ""))}
              maxLength={20}
              placeholder="KINO-XXXXXX-XXXXXX"
              className="w-full rounded-sm border border-black/10 bg-[#FDFDFD] p-5 font-mono text-xl text-[#1A1A1A] shadow-inner outline-none transition-all focus:border-[#B91C1C]"
            />
          </div>
          <p className="text-center font-mono text-[9px] uppercase tracking-widest text-black/20">
            Register past screenings to build your archive.
          </p>
        </div>

        <div className="mt-12 flex gap-4">
          <button
            onClick={() => setShowWatchedModal(false)}
            className="flex-1 rounded-sm border border-black/10 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-black/40 transition-all hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            onClick={handleRegisterWatchedMovie}
            className="flex-1 rounded-sm bg-[#B91C1C] py-4 font-display text-xl uppercase tracking-tight text-white shadow-xl transition-all hover:bg-[#1A1A1A] active:scale-95"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
