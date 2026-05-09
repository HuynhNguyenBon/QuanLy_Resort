package com.BBTT.BBTTResort.repo;

import com.BBTT.BBTTResort.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface  ServiceRepository extends JpaRepository<Service, Long>{
}
