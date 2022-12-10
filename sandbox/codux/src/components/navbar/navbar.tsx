import styles from './navbar.module.scss';

export interface NavbarProps {
    className?: string;
    username: string;
    navigate(location: "home" | "auth"): void;
}

export const Navbar = ({ className, navigate, username }: NavbarProps) => {
    return (<div className={`${styles.root} ${className}`}>
        <p>Hello {username}</p>
        <button />
    </div>);
};
