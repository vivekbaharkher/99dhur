
const StepIndicator = ({ stepNumber, title, isActive = false, isCompleted = false, onClick= () => {} }) => {
    const getStepStyles = () => {
        if (isActive) {
            return {
                container: "primaryBgLight12 rounded-lg p-4 opacity-90 hover:cursor-pointer",
                number: "primaryBg text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0",
                numberText: "text-white font-bold text-sm ",
                title: "primaryColor font-bold text-base"
            };
        } else {
            return {
                container: "primaryBackgroundBg rounded-lg p-4 opacity-90 hover:cursor-pointer",
                number: "bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0",
                numberText: "text-white font-bold text-sm ",
                title: "text-gray-500 font-bold text-base"
            };
        }
    };

    const styles = getStepStyles();

    return (
        <div className={styles.container} onClick={onClick}>
            <div className="flex items-center gap-4">
                <div className={styles.number}>
                    <span className={styles.numberText}>
                        {stepNumber.toString().padStart(2, "0")}
                    </span>
                </div>
                <h3 className={styles.title}>{title}</h3>
            </div>
        </div>
    );
};

export default StepIndicator;