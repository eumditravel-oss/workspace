import React from 'react';

export const Card = ({ children, className }: { children?: React.ReactNode, className?: string }) => <div className={className}>{children}</div>;
export const CardHeader = ({ children, className }: { children?: React.ReactNode, className?: string }) => <div className={className}>{children}</div>;
export const CardTitle = ({ children, className }: { children?: React.ReactNode, className?: string }) => <h3 className={className}>{children}</h3>;
export const CardContent = ({ children, className }: { children?: React.ReactNode, className?: string }) => <div className={className}>{children}</div>;
