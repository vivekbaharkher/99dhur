
const AppointmentButton = ({
    children,
    onClick,
    disabled = false,
    variant = "primary",
    size = "default",
    icon: Icon = null,
    iconPosition = "right",
    className = "",
    ...props
}) => {
    // Map our custom variants to shadcn variants and add custom classes
    const getVariantMapping = () => {
        switch (variant) {
            case "primary":
                return { variant: "default", customClasses: "brandBg text-white" };
            case "outline":
                return { variant: "outline", customClasses: "border-[1.5px] brandBorder text-black" };
            default:
                return {
                    variant: "default", customClasses: ""
                }
        }
    };

    const { customClasses } = getVariantMapping();

    return (
        <button
            className={`${customClasses} flex items-center gap-3 px-4 py-3 rounded-lg font-semibold hover:cursor-pointer disabled:opacity-50`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
            {children}
            {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
        </button>
    );
};

export default AppointmentButton;