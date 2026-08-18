import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Building2 } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { API_BASE } from '../../../lib/constants';
import { authHeaders } from '../../../lib/api';
import { getSessionToken } from '../../../lib/storage';
import { Screen } from '../../../components/ui/Screen';
import { SubHeader } from '../../../components/ui/SubHeader';
import { ListCard, LRow } from '../../../components/ui/ListCard';
import { EmptyState } from '../../../components/ui/EmptyState';

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  hod?: string;
  studentCount?: number;
}

export default function ManageDepartments() {
  const { theme } = useTheme();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const token = await getSessionToken();
      const response = await fetch(`${API_BASE}/api/departments`, {
        headers: authHeaders(token),
      });
      if (response.ok) setDepartments(await response.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen>
        <SubHeader title="Departments" subtitle={`${departments.length} departments`} />

        {loading ? (
          <ActivityIndicator size="large" color={theme.violet} style={{ marginTop: 40 }} />
        ) : departments.length === 0 ? (
          <EmptyState icon={<Building2 size={44} color={theme.faint} />} message="No departments found" />
        ) : (
          <ListCard>
            {departments.map((dept, i) => (
              <LRow
                key={dept._id}
                icon={<Building2 size={18} color={theme.violet} />}
                iconBg="rgba(124,58,237,0.12)"
                title={dept.name}
                subtitle={dept.code}
                last={i === departments.length - 1}
              />
            ))}
          </ListCard>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({});
