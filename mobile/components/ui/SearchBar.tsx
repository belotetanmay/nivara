import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps extends TextInputProps {
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className = '', ...props }) => {
  return (
    <View
      className={`bg-white border border-[#E5E1D8] rounded-full px-4 py-2.5 flex-row items-center shadow-sm ${className}`}
    >
      <Search size={18} color="#6B7280" className="mr-2" />
      <TextInput
        className="flex-1 text-[#0A2540] text-base p-0"
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
};
export default SearchBar;
