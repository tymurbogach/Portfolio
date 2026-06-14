import { useState, useCallback } from 'react';
import DecryptedText from './DecryptedText';

interface MatrixSequenceProps {
  quote: string;
  comment: string;
}

const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

export default function MatrixSequence({ quote, comment }: MatrixSequenceProps) {
  const [showComment, setShowComment] = useState(false);

  const handleQuoteComplete = useCallback(() => {
    setTimeout(() => setShowComment(true), 2000);
  }, []);

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
      <div className="not-italic font-bold" style={{ marginTop: '0.4em', color: 'var(--chart-5)' }}>
        {showComment && (
          <DecryptedText
            text={comment}
            animateOn="view"
            sequential={true}
            revealDirection="start"
            speed={35}
            characters={MATRIX_CHARS}
            encryptedClassName="decrypted-char"
          />
        )}
      </div>
    </>
  );
}
