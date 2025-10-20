import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import searchIcon from "@/assets/searchIcon.svg"
import { useTranslation } from "@/components/context/TranslationContext";

const SearchBar = ({ value, onChange, onSearch, placeholder = "" }) => {
    const t = useTranslation()
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(value);
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-4 w-full">
            <div className="flex w-full">
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t(placeholder)}
                    className={cn(
                        "primaryBackgroundBg newBorder rounded-lg h-12 px-4",
                        "focus:outline-none focus:border-transparent"
                    )}
                    aria-label="Search properties"
                />
            </div>
            <Button
                type="submit"
                className="primaryBg hover:primaryBg/90 h-12 px-4"
                aria-label="Search"
            >
                <Image src={searchIcon} width={20} height={20} className='w-5 h-5' alt='searchButton' />
                <span>{t("search")}</span>
            </Button>
        </form>
    );
};

export default SearchBar;