import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Building2, ChevronDown } from "lucide-react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  manager_id?: string | null;
  avatar_url?: string | null;
  status?: string;
}

interface OrgNode {
  employee: Employee;
  children: OrgNode[];
}

function buildOrgTree(employees: Employee[]): OrgNode[] {
  const employeeMap = new Map<string, OrgNode>();
  const roots: OrgNode[] = [];

  // Create nodes
  employees.forEach(emp => {
    employeeMap.set(emp.id, { employee: emp, children: [] });
  });

  // Build tree
  employees.forEach(emp => {
    const node = employeeMap.get(emp.id)!;
    if (emp.manager_id && employeeMap.has(emp.manager_id)) {
      employeeMap.get(emp.manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function OrgNode({ node, level = 0 }: { node: OrgNode; level?: number }) {
  const { employee, children } = node;
  const initials = `${employee.first_name[0]}${employee.last_name[0]}`;
  const hasChildren = children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className="relative">
        <div className="p-4 rounded-lg bg-card border shadow-sm hover:shadow-md transition-shadow min-w-[180px]">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={employee.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {employee.first_name} {employee.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {employee.role}
              </p>
              <Badge variant="outline" className="text-xs mt-1">
                {employee.department}
              </Badge>
            </div>
          </div>
        </div>
        {hasChildren && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-secondary flex items-center justify-center border">
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Connector line */}
      {hasChildren && (
        <div className="w-px h-6 bg-border" />
      )}

      {/* Children */}
      {hasChildren && (
        <div className="relative">
          {/* Horizontal line */}
          {children.length > 1 && (
            <div 
              className="absolute top-0 h-px bg-border"
              style={{
                left: '50%',
                width: `calc(${(children.length - 1) * 200}px)`,
                transform: 'translateX(-50%)',
              }}
            />
          )}
          
          <div className="flex gap-8 pt-0">
            {children.map((child) => (
              <div key={child.employee.id} className="flex flex-col items-center">
                {children.length > 1 && <div className="w-px h-6 bg-border" />}
                <OrgNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrgChart({ employees }: { employees: Employee[] }) {
  const orgTree = useMemo(() => buildOrgTree(employees), [employees]);

  // Group by department for summary
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(emp => {
      counts[emp.department] = (counts[emp.department] || 0) + 1;
    });
    return counts;
  }, [employees]);

  if (employees.length === 0) {
    return (
      <Card variant="feature">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Organigramme
          </CardTitle>
          <CardDescription>Visualisation de la structure d'équipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Aucun employé</p>
            <p className="text-sm mt-1">Ajoutez des employés pour voir l'organigramme</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="feature">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Organigramme
            </CardTitle>
            <CardDescription>
              {employees.length} employés • {Object.keys(departmentCounts).length} départements
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {Object.entries(departmentCounts).slice(0, 4).map(([dept, count]) => (
              <Badge key={dept} variant="outline" className="text-xs">
                {dept}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-4">
          <div className="flex justify-center min-w-max py-4">
            <div className="flex gap-12">
              {orgTree.map((root) => (
                <OrgNode key={root.employee.id} node={root} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
