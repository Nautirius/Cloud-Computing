import {Compass, MapPin, Settings} from 'lucide-react';
import {FC} from 'react';
import {NavLink} from 'react-router-dom';
import {useTranslation} from 'react-i18next';


interface NavbarProps {
}

export const Navbar: FC<NavbarProps> = () => {
    const {t} = useTranslation();

    const navItems = [
        {href: "/", label: "Connections", icon: MapPin},
        {href: "/explore", label: "Explore", icon: Compass},
        {href: "/admin", label: "Admin", icon: Settings},
    ]


    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <NavLink to="/" className="flex items-center gap-2">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary transition-transform group-hover:scale-105">
                            <MapPin className="h-5 w-5 text-primary-foreground"/>
                        </div>
                        <span className="text-xl font-semibold text-foreground">GeoGraph</span>
                    </NavLink>

                    <div className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"}>
                                    <Icon className="h-4 w-4"/>
                                    <span className="hidden sm:inline">{item.label}</span>
                                </NavLink>
                            )
                        })}
                    </div>
                </div>
            </div>
        </header>
    );
};
