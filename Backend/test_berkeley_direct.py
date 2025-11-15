#!/usr/bin/env python3
"""
Prueba directa del algoritmo Berkeley
"""
import asyncio
import time
from app.distributed.berkeley_algorithm import BerkeleyTimeSync, NodeRole

async def test_berkeley_algorithm():
    """Probar algoritmo Berkeley directamente"""
    print("🧪 TESTING ALGORITMO BERKELEY DIRECTAMENTE")
    print("=" * 60)
    
    try:
        # Crear nodo maestro
        master = BerkeleyTimeSync("master_node", NodeRole.MASTER, sync_interval=5.0)
        await master.start_sync_service()
        
        print("✅ Nodo maestro creado e iniciado")
        print(f"   Node ID: {master.node_id}")
        print(f"   Rol: {master.role.value}")
        print(f"   Tiempo sincronizado: {master.get_synchronized_time():.3f}")
        
        # Simular algunos nodos esclavos
        await master.register_slave_node("slave_1", "localhost", 8001)
        await master.register_slave_node("slave_2", "localhost", 8002)
        
        print("✅ Nodos esclavos registrados")
        print(f"   Esclavos registrados: {len(master.slave_nodes)}")
        
        # Obtener estado
        status = master.get_sync_status()
        print(f"✅ Estado del maestro:")
        print(f"   Nodos esclavos: {len(status.get('slave_nodes', {}))}")
        print(f"   Tiempo local: {status.get('local_time', 0):.3f}")
        print(f"   Tiempo sincronizado: {status.get('synchronized_time', 0):.3f}")
        print(f"   Offset: {status.get('time_offset', 0):.3f}s")
        
        # Probar métricas
        metrics = master.sync_stats
        print(f"✅ Métricas:")
        print(f"   Total syncs: {metrics['total_syncs']}")
        print(f"   Successful syncs: {metrics['successful_syncs']}")
        print(f"   Failed syncs: {metrics['failed_syncs']}")
        
        # Crear nodo esclavo
        print("\n🔄 Creando nodo esclavo...")
        slave = BerkeleyTimeSync("slave_node", NodeRole.SLAVE, sync_interval=5.0)
        await slave.start_sync_service()
        await slave.set_master_node("master_node", "localhost", 8000)
        
        print("✅ Nodo esclavo creado")
        print(f"   Node ID: {slave.node_id}")
        print(f"   Rol: {slave.role.value}")
        print(f"   Tiempo sincronizado: {slave.get_synchronized_time():.3f}")
        
        # Simular ajuste de tiempo
        print("\n⚙️ Simulando ajuste de tiempo...")
        adjustment_data = {
            "adjustment": 0.5,  # 500ms
            "target_time": time.time() + 0.5,
            "confidence": 0.9,
            "master_id": "master_node"
        }
        
        result = slave.handle_time_adjustment(adjustment_data)
        print(f"✅ Ajuste aplicado:")
        print(f"   Éxito: {result.get('success', False)}")
        print(f"   Ajuste aplicado: {result.get('applied_adjustment', 0):.3f}s")
        print(f"   Nuevo offset: {result.get('new_offset', 0):.3f}s")
        
        # Detener servicios
        await master.stop_sync_service()
        await slave.stop_sync_service()
        print("✅ Servicios detenidos")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en prueba de algoritmo Berkeley: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_berkeley_algorithm())