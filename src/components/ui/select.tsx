export const Select = ({ children, onValueChange, value }: any) => <select value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>;
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>;
export const SelectTrigger = ({ children }: any) => <>{children}</>;
export const SelectValue = ({ placeholder }: any) => <option disabled>{placeholder}</option>;
