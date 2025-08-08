import { useParams, useOutletContext } from "react-router";
import { ServiceFrame } from "../components/service-frame/ServiceFrame";
import type { Config, SanitizedService } from "../../shared/types/config";

interface ContextType {
  config: {
    app: Config["app"];
    services: SanitizedService[];
  };
}

export default function ServicePage() {
  const { id } = useParams();
  const context = useOutletContext<ContextType>();
  
  if (!context || !context.config) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  const { config } = context;
  
  const service = config.services.find(s => s.id === id);

  if (!service) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">❓</div>
          <p className="text-gray-400">Service not found</p>
        </div>
      </div>
    );
  }

  return <ServiceFrame serviceId={service.id} serviceName={service.name} />;
}