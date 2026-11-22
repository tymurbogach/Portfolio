import { useEffect, useRef, useState, useCallback } from "react";
import DecryptedText from "./DecryptedText";

interface MatrixSequenceProps {
  quote: string;
  comment: string;
}

const MATRIX_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

export default function MatrixSequence({
  quote,
  comment,
}: MatrixSequenceProps) {
  const [showComment, setShowComment] = useState(false);
  const commentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQuoteComplete = useCallback(() => {
    commentTimer.current = setTimeout(() => setShowComment(true), 2000);
  }, []);

  // Fast navigation between the reveal and the timer leaves a setState
  // aimed at a dead component: clear the timer on unmount.
  useEffect(
    () => () => {
      if (commentTimer.current) clearTimeout(commentTimer.current);
    },
    [],
  );

  return (
    <>
      <div>
        <DecryptedText
          text={quote}
          animateOn="view"
          sequential={true}
          revealDirection="start"
          speed={30}
          characters={MATRIX_CHARS}
          encryptedClassName="decrypted-char"
          onComplete={handleQuoteComplete}
        />
      </div>
      <div
        className="font-bold not-italic"
        style={{ marginTop: "0.4em", color: "var(--chart-5)" }}
      >
        {showComment ? (
          <DecryptedText
            text={comment}
            animateOn="view"
            sequential={true}
            revealDirection="start"
            speed={35}
            characters={MATRIX_CHARS}
            encryptedClassName="decrypted-char"
          />
        ) : (
          <span style={{ opacity: 0 }}>{comment}</span>
        )}
      </div>
    </>
  );
}
