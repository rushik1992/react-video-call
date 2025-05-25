import React, { FC } from 'react';
import icons from './icons';
import "../../index.css";
import "./icons.scss";

interface MyState {
  className?: string;
  type: string;
  title?: string;
  style?: React.CSSProperties
}
export const Icon: FC<MyState> = 
  (
    { className, type, title, style, ...props }: MyState
  ) => {
    const svgIcon = icons[type]||null;
    return (
      <>
        {svgIcon && (
          <i
            style={style ?? {}}
            className={`select-none custIcon custIcon-${type} ${className ?? ''}`}
            title={title ?? ' '}
            {...props}
          >
            {svgIcon}
          </i>
        )}
      </>
    );
  };

export default Icon;