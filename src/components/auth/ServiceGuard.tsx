import { ReactNode } from 'react';
import { useServices, getRouteService } from '@/hooks/useServices';
import { LoadingState } from '@/components/ui/loading-state';
import { ServiceUpsell } from '@/components/upsell/ServiceUpsell';
import { useTranslation } from 'react-i18next';

// Service metadata for upsell screens
const SERVICE_META: Record<string, {
  name: string;
  descriptionKey: string;
  featuresKeys: string[];
  price: string;
}> = {
  marketing: { name: 'Marketing', descriptionKey: 'serviceGuard.marketingDesc', featuresKeys: ['serviceGuard.marketingF1','serviceGuard.marketingF2','serviceGuard.marketingF3','serviceGuard.marketingF4','serviceGuard.marketingF5'], price: "49" },
  sales: { name: 'Sales', descriptionKey: 'serviceGuard.salesDesc', featuresKeys: ['serviceGuard.salesF1','serviceGuard.salesF2','serviceGuard.salesF3','serviceGuard.salesF4','serviceGuard.salesF5'], price: "39" },
  finance: { name: 'Finance', descriptionKey: 'serviceGuard.financeDesc', featuresKeys: ['serviceGuard.financeF1','serviceGuard.financeF2','serviceGuard.financeF3','serviceGuard.financeF4','serviceGuard.financeF5'], price: "29" },
  security: { name: 'Security', descriptionKey: 'serviceGuard.securityDesc', featuresKeys: ['serviceGuard.securityF1','serviceGuard.securityF2','serviceGuard.securityF3','serviceGuard.securityF4','serviceGuard.securityF5'], price: "29" },
  product: { name: 'Product', descriptionKey: 'serviceGuard.productDesc', featuresKeys: ['serviceGuard.productF1','serviceGuard.productF2','serviceGuard.productF3','serviceGuard.productF4','serviceGuard.productF5'], price: "29" },
  engineering: { name: 'Engineering', descriptionKey: 'serviceGuard.engineeringDesc', featuresKeys: ['serviceGuard.engineeringF1','serviceGuard.engineeringF2','serviceGuard.engineeringF3','serviceGuard.engineeringF4','serviceGuard.engineeringF5'], price: "29" },
  data: { name: 'Data', descriptionKey: 'serviceGuard.dataDesc', featuresKeys: ['serviceGuard.dataF1','serviceGuard.dataF2','serviceGuard.dataF3','serviceGuard.dataF4','serviceGuard.dataF5'], price: "39" },
  support: { name: 'Support', descriptionKey: 'serviceGuard.supportDesc', featuresKeys: ['serviceGuard.supportF1','serviceGuard.supportF2','serviceGuard.supportF3','serviceGuard.supportF4','serviceGuard.supportF5'], price: "19" },
  governance: { name: 'Governance', descriptionKey: 'serviceGuard.governanceDesc', featuresKeys: ['serviceGuard.governanceF1','serviceGuard.governanceF2','serviceGuard.governanceF3','serviceGuard.governanceF4','serviceGuard.governanceF5'], price: "49" },
};

interface ServiceGuardProps {
  children: ReactNode;
  service?: string;
  routePath?: string;
}

export function ServiceGuard({ 
  children, 
  service: explicitService,
  routePath
}: ServiceGuardProps) {
  const { t } = useTranslation();
  const { hasService, servicesLoading, catalogLoading } = useServices();
  
  const requiredService = explicitService || (routePath ? getRouteService(routePath) : null);
  
  if (servicesLoading || catalogLoading) {
    return <LoadingState message={t("common.verifyingAccess")} />;
  }
  
  if (!requiredService) {
    return <>{children}</>;
  }
  
  if (requiredService === 'core-os') {
    return <>{children}</>;
  }
  
  if (hasService(requiredService)) {
    return <>{children}</>;
  }
  
  const meta = SERVICE_META[requiredService];
  if (meta) {
    return (
      <ServiceUpsell
        serviceSlug={requiredService}
        serviceName={meta.name}
        description={t(meta.descriptionKey)}
        features={meta.featuresKeys.map(k => t(k))}
        price={meta.price}
      />
    );
  }

  return (
    <ServiceUpsell
      serviceSlug={requiredService}
      serviceName={requiredService.charAt(0).toUpperCase() + requiredService.slice(1)}
      description={t("serviceGuard.activateService")}
      features={[]}
      price="29"
    />
  );
}

export function withServiceGuard<P extends object>(
  Component: React.ComponentType<P>,
  service: string
) {
  return function ServiceGuardedComponent(props: P) {
    return (
      <ServiceGuard service={service}>
        <Component {...props} />
      </ServiceGuard>
    );
  };
}
