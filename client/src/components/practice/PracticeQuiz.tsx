import { useState } from "react";
import { ApiPracticeQuestion } from "../../api/practice";

const difficultyColor: Record<string, string> = {
  easy: "text-success",
  medium: "text-line-amber",
  hard: "text-line-coral",
};

export default function PracticeQuiz({ questions }: { questions: ApiPracticeQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) return null;

  const q = questions[index];
  const isCorrect = selected === q.correctAnswer;

  function handleSelect(option: string) {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    if (option === q.correctAnswer) setScore((s) => s + 1);
  }

  function handleNext() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  }

  function handleRestart() {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="rounded-card border border-border bg-surface p-6 text-center">
        <p className="station-code mb-2">Practice complete</p>
        <p className="font-display text-2xl font-semibold">
          {score} / {questions.length}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          {score === questions.length ? "Perfect score." : "Review the ones you missed, then try again."}
        </p>
        <button
          onClick={handleRestart}
          className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Restart practice
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-text-faint">
          Question {index + 1} / {questions.length}
        </span>
        <span className={`font-mono text-xs uppercase ${difficultyColor[q.difficulty]}`}>{q.difficulty}</span>
      </div>

      <p className="font-display text-base font-semibold text-text-primary">{q.prompt}</p>

      {q.options.length > 0 ? (
        <div className="mt-4 space-y-2">
          {q.options.map((opt) => {
            const isSelected = selected === opt;
            const showCorrect = revealed && opt === q.correctAnswer;
            const showWrong = revealed && isSelected && opt !== q.correctAnswer;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={revealed}
                className={`block w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                  showCorrect
                    ? "border-success bg-success/10 text-success"
                    : showWrong
                    ? "border-danger bg-danger/10 text-danger"
                    : "border-border text-text-primary hover:border-border-strong"
                } ${revealed ? "cursor-default" : "cursor-pointer"}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        !revealed && (
          <button
            onClick={() => handleSelect(q.correctAnswer)}
            className="mt-4 rounded border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary"
          >
            Show answer
          </button>
        )
      )}

      {revealed && (
        <div className="mt-4 rounded-lg border border-border bg-ink p-4">
          <p className={`text-sm font-medium ${isCorrect ? "text-success" : "text-danger"}`}>
            {q.options.length > 0 ? (isCorrect ? "Correct" : `Not quite — correct answer: ${q.correctAnswer}`) : q.correctAnswer}
          </p>
          {q.explanation && <p className="mt-1.5 text-sm text-text-muted">{q.explanation}</p>}
          <button
            onClick={handleNext}
            className="mt-3 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            {index + 1 < questions.length ? "Next question →" : "Finish"}
          </button>
        </div>
      )}
    </div>
  );
}
