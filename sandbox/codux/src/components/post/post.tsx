import styles from './post.module.scss';

export interface PostProps {
    className?: string;
    header?: string;
    body?: string;
}

export const Post = ({ className, body, header }: PostProps) => {
    return <div className={`${styles.root} ${className}`}>
        <span className={styles['note-fold']}></span>
        <h5 className={styles.heading}>{header}</h5>
        <p className={styles.body}>
            {body}
        </p>
    </div>;
};
