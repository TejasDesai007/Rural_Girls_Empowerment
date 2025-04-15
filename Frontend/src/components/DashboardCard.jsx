import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function DashboardCard({ label, value, icon: Icon, color = "purple" }) {
  const colorMap = {
    purple: "border-purple-500 text-purple-600",
    blue: "border-blue-500 text-blue-600",
    green: "border-green-500 text-green-600",
    red: "border-red-500 text-red-600",
    yellow: "border-yellow-500 text-yellow-600",
  };

  const colorClasses = colorMap[color] || colorMap.purple;

  return (
    <motion.div
      className="w-full max-w-xs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className={`border-l-4 ${colorClasses} bg-white shadow-md hover:shadow-xl transition-all duration-300 p-4 rounded-xl`}
      >
        <CardContent className="flex items-center gap-4">
          <div className={`text-3xl ${colorClasses}`}>
            {Icon && <Icon className="w-8 h-8" />}
          </div>
          <div>
            <h4 className="text-sm text-gray-600 font-medium">{label}</h4>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
