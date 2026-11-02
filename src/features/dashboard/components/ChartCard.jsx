import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ChartCard({ title, description, children, className }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Shown inside a chart card when the period has no data
export function NoData({ text = 'No data for this period' }) {
  return <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">{text}</p>;
}
