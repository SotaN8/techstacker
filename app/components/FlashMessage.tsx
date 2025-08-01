import React, { useRef } from 'react';
import { useAtom } from 'jotai';
import { CSSTransition } from 'react-transition-group';
import { derivedFlashMessageAtom, flashShownAtom } from '../store/flash';
import classNames from 'classnames';

import styles from './FlashMessage.module.css';

const FlashMessage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [flashMessage] = useAtom(derivedFlashMessageAtom);
  const [flashShown] = useAtom(flashShownAtom);

  return (
    <CSSTransition
      in={flashShown}
      nodeRef={containerRef}
      timeout={500}
      classNames={styles}
      unmountOnExit
    >
      {flashMessage?.variant === 'unlock' ? (
        <div className={styles.unlockContainer} ref={containerRef}>
          <div className={styles.coin}>
            <div className={classNames(styles.coinFront, styles.coinSide)}>
              {flashMessage?.icon}
            </div>
            <div className={classNames(styles.coinBack, styles.coinSide)}>
              {flashMessage?.icon}
            </div>
          </div>
          <span className={styles.unlockFlash}>{flashMessage?.message}</span>
        </div>
      ) : (
        <div className={styles.container} ref={containerRef}>
          <span className={styles.flash}>
            {flashMessage?.icon}
            {flashMessage?.message}
          </span>
        </div>
      )}
    </CSSTransition>
  );
};

export default FlashMessage;
